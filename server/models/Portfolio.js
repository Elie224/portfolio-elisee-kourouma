const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  personal: {
    fullName: String,
    email: String,
    phone: String,
    photo: String,
    currentEducation: String,
    previousEducation: String,
    additionalInfo: [String]
  },
  projects: [{
    title: String,
    type: String,
    category: String,
    shortDesc: String,
    description: String,
    features: [String],
    tags: [String],
    link: String,
    demoLink: String,
    emailSubject: String,
    featured: Boolean,
    public: Boolean
  }],
  skills: [{
    icon: String,
    name: String,
    skills: [String]
  }],
  links: {
    cv: String,
    cvFile: String,
    cvFileName: String,
    cvFileSize: Number,
    social: [{
      name: String,
      url: String
    }]
  },
  about: {
    heroDescription: String,
    aboutDescription: String,
    stats: {
      projects: Number,
      experience: Number,
      technologies: Number
    }
  },
  timeline: [{
    date: String,
    title: String,
    subtitle: String,
    description: String
  }],
  services: [{
    icon: String,
    title: String,
    description: String,
    features: [String]
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: String,
    link: String
  }],
  contactMessages: [{
    id: Number,
    name: String,
    email: String,
    subject: String,
    message: String,
    date: String,
    read: Boolean
  }],
  faq: [{
    question: String,
    answer: String
  }]
}, {
  timestamps: true
});

// Il n'y aura qu'un seul document portfolio
portfolioSchema.statics.getPortfolio = async function() {
  let portfolio = await this.findOne();
  if (!portfolio) {
    portfolio = await this.create({});
  }
  return portfolio;
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
