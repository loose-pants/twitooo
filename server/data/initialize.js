import bcrypt from 'bcryptjs';

// In-memory data storage
export const users = [];
export const tweets = [];
export const likes = [];
export const retweets = [];
export const follows = [];
export const replies = [];

let userIdCounter = 1;
let tweetIdCounter = 1;
let likeIdCounter = 1;
let retweetIdCounter = 1;
let followIdCounter = 1;
let replyIdCounter = 1;

export function initializeData() {
  // Initialize users with enhanced profiles
  const initialUsers = [
    { 
      username: 'admin', 
      password: 'adminpass', 
      role: 'admin',
      displayName: 'Admin User',
      bio: 'Platform Administrator • Managing the future of social media',
      location: 'San Francisco, CA',
      website: 'https://twittoo.com',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      banner: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
      verified: true
    },
    { 
      username: 'editor', 
      password: 'editorpass', 
      role: 'editor',
      displayName: 'Sarah Editor',
      bio: 'Content Editor • Curating amazing stories • Coffee enthusiast ☕',
      location: 'New York, NY',
      website: 'https://saraheditor.com',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      banner: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
      verified: false
    },
    { 
      username: 'user', 
      password: 'userpass', 
      role: 'user',
      displayName: 'John User',
      bio: 'Tech enthusiast • Love coding and coffee • Building the future',
      location: 'Austin, TX',
      website: 'https://johnuser.dev',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      banner: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
      verified: false
    },
    { 
      username: 'alice', 
      password: 'alicepass', 
      role: 'user',
      displayName: 'Alice Johnson',
      bio: 'Full-stack developer • React enthusiast • Dog lover 🐕',
      location: 'Seattle, WA',
      website: 'https://alicejohnson.dev',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      banner: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
      verified: false
    },
    { 
      username: 'bob', 
      password: 'bobpass', 
      role: 'user',
      displayName: 'Bob Smith',
      bio: 'Backend engineer • Node.js expert • Always learning something new',
      location: 'Denver, CO',
      website: 'https://bobsmith.tech',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      banner: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
      verified: false
    },
    { 
      username: 'emma', 
      password: 'emmapass', 
      role: 'user',
      displayName: 'Emma Wilson',
      bio: 'UI/UX Designer • Creating beautiful experiences • Design systems advocate',
      location: 'Los Angeles, CA',
      website: 'https://emmawilson.design',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      banner: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
      verified: false
    }
  ];

  initialUsers.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 12);
    users.push({
      id: userIdCounter++,
      username: user.username,
      password: hashedPassword,
      role: user.role,
      displayName: user.displayName,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar,
      banner: user.banner,
      verified: user.verified,
      followersCount: Math.floor(Math.random() * 1000) + 50,
      followingCount: Math.floor(Math.random() * 500) + 20,
      tweetsCount: 0,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  });

  // Initialize enhanced tweets with images and rich content
  const initialTweets = [
    { 
      userId: 1, 
      username: 'admin', 
      content: 'Welcome to Twittoo! 🚀 The future of microblogging is here. Join our amazing community and share your thoughts with the world! #Welcome #Twittoo #SocialMedia',
      images: ['https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    },
    { 
      userId: 2, 
      username: 'editor', 
      content: 'Just finished reviewing some incredible content today! 📝 The quality of posts on this platform continues to amaze me. Keep up the great work everyone! #ContentCreation #Quality',
      images: []
    },
    { 
      userId: 3, 
      username: 'user', 
      content: 'Hello Twittoo community! 👋 Excited to be part of this amazing platform. Looking forward to connecting with fellow tech enthusiasts! #HelloWorld #TechCommunity',
      images: []
    },
    { 
      userId: 4, 
      username: 'alice', 
      content: 'Just finished reading "Clean Code" by Robert Martin 📚 Highly recommend it to all developers! The principles in this book are game-changing. #CleanCode #Programming #BookRecommendation',
      images: ['https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    },
    { 
      userId: 5, 
      username: 'bob', 
      content: 'Deep diving into Node.js microservices today! 🔧 The architecture patterns are fascinating. Building scalable systems is both challenging and rewarding. #NodeJS #Microservices #BackendDev',
      images: []
    },
    { 
      userId: 6, 
      username: 'emma', 
      content: 'Working on a new design system! 🎨 Color palettes, typography, and component libraries coming together beautifully. Design systems are the backbone of great UX! #DesignSystems #UX #UI',
      images: ['https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    },
    { 
      userId: 1, 
      username: 'admin', 
      content: 'Beautiful morning for coding! ☀️ Remember to take breaks, stay hydrated, and keep that work-life balance. Your mental health matters! 💻☕ #WorkLifeBalance #MentalHealth #Coding',
      images: ['https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    },
    { 
      userId: 3, 
      username: 'user', 
      content: 'The JavaScript ecosystem moves so fast! 🚀 Just when you think you\'ve caught up, there\'s a new framework or tool to learn. Embracing the journey of continuous learning! #JavaScript #WebDev #Learning',
      images: []
    },
    { 
      userId: 4, 
      username: 'alice', 
      content: 'Coffee is absolutely essential for productivity! ☕ What\'s your favorite brewing method? I\'m currently obsessed with pour-over coffee. The ritual is almost as important as the caffeine! #Coffee #Productivity',
      images: ['https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    },
    { 
      userId: 5, 
      username: 'bob', 
      content: 'Pro tip: Always write tests for your code! 🧪 Future you will thank present you when you need to refactor or add new features. Testing is not optional, it\'s essential! #Testing #BestPractices #CleanCode',
      images: []
    },
    { 
      userId: 2, 
      username: 'editor', 
      content: 'The power of good documentation cannot be overstated! 📖 It\'s like writing a love letter to your future self and your teammates. Clear docs save countless hours! #Documentation #TeamWork',
      images: []
    },
    { 
      userId: 6, 
      username: 'emma', 
      content: 'User research session today! 👥 Nothing beats talking directly to users to understand their pain points and needs. Data-driven design decisions for the win! #UserResearch #UXDesign #DataDriven',
      images: ['https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    },
    { 
      userId: 1, 
      username: 'admin', 
      content: 'Reminder: Be kind, be helpful, and keep learning! 🌟 That\'s what makes great communities thrive. Together we can build something amazing! #Community #Kindness #Growth',
      images: []
    },
    { 
      userId: 4, 
      username: 'alice', 
      content: 'Just deployed my first full-stack app to production! 🎉 The feeling is incredible. From localhost to the world wide web! Thanks to everyone who helped along the way! #Deployment #FullStack #Achievement',
      images: ['https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    },
    { 
      userId: 3, 
      username: 'user', 
      content: 'AI in web development is fascinating! 🤖 From code completion to automated testing, AI is transforming how we build software. The future looks incredibly bright! #AI #WebDev #Future #Technology',
      images: []
    },
    { 
      userId: 5, 
      username: 'bob', 
      content: 'Debugging is like being a detective in a crime movie where you\'re also the murderer! 🕵️‍♂️ But hey, that\'s what makes it interesting, right? #Debugging #Programming #Humor',
      images: []
    },
    { 
      userId: 2, 
      username: 'editor', 
      content: 'Clean code is not written by following a set of rules. Clean code is written by passionate programmers who care about their craft! 💎 #CleanCode #Craftsmanship #Programming',
      images: []
    },
    { 
      userId: 6, 
      username: 'emma', 
      content: 'Accessibility is not a feature, it\'s a fundamental right! ♿ Designing inclusive experiences benefits everyone. Let\'s build a web that works for all! #Accessibility #InclusiveDesign #WebForAll',
      images: ['https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    },
    { 
      userId: 1, 
      username: 'admin', 
      content: 'Remember: Every expert was once a beginner! 🌱 Every pro was once an amateur. Keep pushing forward, embrace the learning process, and celebrate small wins! #Growth #Learning #Motivation',
      images: []
    },
    { 
      userId: 4, 
      username: 'alice', 
      content: 'The best error message is the one that never shows up! 🚫 Prevention is better than cure. Defensive programming and proper validation save the day! #ErrorHandling #BestPractices',
      images: []
    },
    { 
      userId: 3, 
      username: 'user', 
      content: 'Collaboration over competition! 🤝 Let\'s build amazing things together. The tech community is strongest when we support each other! #Collaboration #Community #TechTogether',
      images: []
    },
    { 
      userId: 5, 
      username: 'bob', 
      content: 'Performance optimization is an art! 🎨 Every millisecond counts in user experience. From lazy loading to code splitting, every optimization matters! #Performance #WebOptimization #UX',
      images: ['https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop']
    }
  ];

  initialTweets.forEach(tweet => {
    const newTweet = {
      id: tweetIdCounter++,
      userId: tweet.userId,
      username: tweet.username,
      content: tweet.content,
      images: tweet.images || [],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likesCount: Math.floor(Math.random() * 100),
      retweetsCount: Math.floor(Math.random() * 50),
      repliesCount: Math.floor(Math.random() * 25),
      isRetweet: false,
      originalTweetId: null,
      replyToId: null
    };
    tweets.push(newTweet);
  });

  // Update users tweet counts
  users.forEach(user => {
    user.tweetsCount = tweets.filter(tweet => tweet.userId === user.id).length;
  });

  // Initialize some sample follows
  const sampleFollows = [
    { followerId: 1, followingId: 2 },
    { followerId: 1, followingId: 3 },
    { followerId: 2, followingId: 1 },
    { followerId: 2, followingId: 4 },
    { followerId: 3, followingId: 1 },
    { followerId: 3, followingId: 4 },
    { followerId: 4, followingId: 1 },
    { followerId: 4, followingId: 2 },
    { followerId: 5, followingId: 1 },
    { followerId: 6, followingId: 2 }
  ];

  sampleFollows.forEach(follow => {
    follows.push({
      id: followIdCounter++,
      followerId: follow.followerId,
      followingId: follow.followingId,
      createdAt: new Date().toISOString()
    });
  });

  console.log(`✅ Initialized ${users.length} users, ${tweets.length} tweets, and ${follows.length} follows`);
}

export { userIdCounter, tweetIdCounter, likeIdCounter, retweetIdCounter, followIdCounter, replyIdCounter };