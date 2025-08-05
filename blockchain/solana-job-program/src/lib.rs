use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod job_portal {
    use super::*;

    // Initialize a new job
    pub fn create_job(
        ctx: Context<CreateJob>,
        job_id: u64,
        title: String,
        description: String,
        salary: u64,
        employer: Pubkey,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        
        job.job_id = job_id;
        job.title = title;
        job.description = description;
        job.salary = salary;
        job.employer = employer;
        job.worker = Pubkey::default();
        job.status = JobStatus::Open;
        job.created_at = Clock::get()?.unix_timestamp;
        job.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // Apply for a job
    pub fn apply_for_job(
        ctx: Context<ApplyForJob>,
        cover_letter: String,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let application = &mut ctx.accounts.application;
        
        require!(job.status == JobStatus::Open, JobError::JobNotOpen);
        require!(job.worker == Pubkey::default(), JobError::JobAlreadyAssigned);
        
        application.job_id = job.job_id;
        application.applicant = ctx.accounts.applicant.key();
        application.cover_letter = cover_letter;
        application.status = ApplicationStatus::Applied;
        application.applied_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // Assign job to worker
    pub fn assign_job(
        ctx: Context<AssignJob>,
        worker: Pubkey,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        
        require!(job.employer == ctx.accounts.employer.key(), JobError::Unauthorized);
        require!(job.status == JobStatus::Open, JobError::JobNotOpen);
        
        job.worker = worker;
        job.status = JobStatus::InProgress;
        job.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // Complete job and process payment
    pub fn complete_job(
        ctx: Context<CompleteJob>,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        
        require!(job.employer == ctx.accounts.employer.key(), JobError::Unauthorized);
        require!(job.status == JobStatus::InProgress, JobError::JobNotInProgress);
        
        // Transfer payment from employer to worker
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.employer_token_account.to_account_info(),
                to: ctx.accounts.worker_token_account.to_account_info(),
                authority: ctx.accounts.employer.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, job.salary)?;
        
        job.status = JobStatus::Completed;
        job.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // Cancel job
    pub fn cancel_job(
        ctx: Context<CancelJob>,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        
        require!(job.employer == ctx.accounts.employer.key(), JobError::Unauthorized);
        require!(job.status == JobStatus::Open, JobError::JobNotOpen);
        
        job.status = JobStatus::Cancelled;
        job.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // Update job application status
    pub fn update_application_status(
        ctx: Context<UpdateApplicationStatus>,
        status: ApplicationStatus,
    ) -> Result<()> {
        let application = &mut ctx.accounts.application;
        let job = &ctx.accounts.job;
        
        require!(job.employer == ctx.accounts.employer.key(), JobError::Unauthorized);
        
        application.status = status;
        application.updated_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // Pay platform fee for job posting
    pub fn pay_platform_fee(
        ctx: Context<PayPlatformFee>,
        amount: u64,
    ) -> Result<()> {
        // Transfer fee from user to platform
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.platform_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, amount)?;
        
        // Create payment record
        let payment = &mut ctx.accounts.payment;
        payment.user = ctx.accounts.user.key();
        payment.amount = amount;
        payment.timestamp = Clock::get()?.unix_timestamp;
        payment.status = PaymentStatus::Completed;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateJob<'info> {
    #[account(
        init,
        payer = employer,
        space = 8 + Job::LEN,
        seeds = [b"job", job_id.to_le_bytes().as_ref()],
        bump
    )]
    pub job: Account<'info, Job>,
    
    #[account(mut)]
    pub employer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApplyForJob<'info> {
    #[account(mut)]
    pub job: Account<'info, Job>,
    
    #[account(
        init,
        payer = applicant,
        space = 8 + Application::LEN,
        seeds = [b"application", job.job_id.to_le_bytes().as_ref(), applicant.key().as_ref()],
        bump
    )]
    pub application: Account<'info, Application>,
    
    #[account(mut)]
    pub applicant: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AssignJob<'info> {
    #[account(mut)]
    pub job: Account<'info, Job>,
    pub employer: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteJob<'info> {
    #[account(mut)]
    pub job: Account<'info, Job>,
    
    #[account(mut)]
    pub employer: Signer<'info>,
    
    #[account(mut)]
    pub employer_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub worker_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelJob<'info> {
    #[account(mut)]
    pub job: Account<'info, Job>,
    pub employer: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateApplicationStatus<'info> {
    #[account(mut)]
    pub application: Account<'info, Application>,
    pub job: Account<'info, Job>,
    pub employer: Signer<'info>,
}

#[derive(Accounts)]
pub struct PayPlatformFee<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub platform_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = user,
        space = 8 + Payment::LEN,
        seeds = [b"payment", user.key().as_ref(), Clock::get()?.unix_timestamp.to_le_bytes().as_ref()],
        bump
    )]
    pub payment: Account<'info, Payment>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Job {
    pub job_id: u64,
    pub title: String,
    pub description: String,
    pub salary: u64,
    pub employer: Pubkey,
    pub worker: Pubkey,
    pub status: JobStatus,
    pub created_at: i64,
    pub updated_at: i64,
}

#[account]
pub struct Application {
    pub job_id: u64,
    pub applicant: Pubkey,
    pub cover_letter: String,
    pub status: ApplicationStatus,
    pub applied_at: i64,
    pub updated_at: i64,
}

#[account]
pub struct Payment {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub status: PaymentStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum JobStatus {
    Open,
    InProgress,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ApplicationStatus {
    Applied,
    Reviewing,
    Interviewing,
    Accepted,
    Rejected,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PaymentStatus {
    Pending,
    Completed,
    Failed,
}

impl Job {
    pub const LEN: usize = 8 + 8 + 200 + 1000 + 8 + 32 + 32 + 1 + 8 + 8;
}

impl Application {
    pub const LEN: usize = 8 + 8 + 32 + 1000 + 1 + 8 + 8;
}

impl Payment {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 1;
}

#[error_code]
pub enum JobError {
    #[msg("Job is not open")]
    JobNotOpen,
    #[msg("Job is not in progress")]
    JobNotInProgress,
    #[msg("Job is already assigned")]
    JobAlreadyAssigned,
    #[msg("Unauthorized")]
    Unauthorized,
} 