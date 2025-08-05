const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: {
      type: String,
      required: true,
      maxlength: 2000
    },
    media: [{
      type: {
        type: String,
        enum: ['image', 'video', 'document']
      },
      url: String,
      filename: String,
      size: Number
    }]
  },
  type: {
    type: String,
    enum: ['general', 'job', 'achievement', 'article', 'event'],
    default: 'general'
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  visibility: {
    type: String,
    enum: ['public', 'connections', 'private'],
    default: 'public'
  },
  tags: [String],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [String],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 300
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  engagement: {
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    totalShares: {
      type: Number,
      default: 0
    }
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ 'content.text': 'text' });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for share count
postSchema.virtual('shareCount').get(function() {
  return this.shares.length;
});

// Virtual for engagement score
postSchema.virtual('engagementScore').get(function() {
  return this.likeCount + (this.commentCount * 2) + (this.shareCount * 3);
});

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.likes.some(like => like.user.toString() === userId.toString())) {
    this.likes.push({ user: userId });
    this.engagement.totalLikes += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    this.engagement.totalLikes -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add comment
postSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content
  });
  this.engagement.totalComments += 1;
  return this.save();
};

// Method to add share
postSchema.methods.addShare = function(userId) {
  if (!this.shares.some(share => share.user.toString() === userId.toString())) {
    this.shares.push({ user: userId });
    this.engagement.totalShares += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to increment views
postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to check if user shared the post
postSchema.methods.isSharedBy = function(userId) {
  return this.shares.some(share => share.user.toString() === userId.toString());
};

// Static method to find posts by hashtag
postSchema.statics.findByHashtag = function(hashtag) {
  return this.find({
    hashtags: hashtag,
    isDeleted: false
  }).sort({ createdAt: -1 });
};

// Static method to find trending posts
postSchema.statics.findTrending = function(limit = 10) {
  return this.find({
    isDeleted: false,
    visibility: 'public'
  })
  .sort({ 'engagement.totalLikes': -1, 'engagement.totalComments': -1 })
  .limit(limit);
};

// Static method to find posts by user
postSchema.statics.findByUser = function(userId, visibility = 'public') {
  return this.find({
    author: userId,
    visibility: visibility,
    isDeleted: false
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Post', postSchema); 