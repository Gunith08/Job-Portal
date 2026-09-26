// seeder.js
// Standalone database seed script to populate sample Users, Jobs, and Applications
// Run using: npm run seed

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

dotenv.config();

const sampleUsers = [
  // 1. Admin
  {
    name: 'Platform Administrator',
    email: 'admin@jobportal.com',
    password: 'adminPassword123',
    role: 'admin',
    phone: '+91 9876543210',
  },
  // 2. Employer 1
  {
    name: 'Vikram Mehta',
    email: 'recruiter@techcorp.in',
    password: 'employerPassword123',
    role: 'employer',
    phone: '+91 9812345678',
    companyDetails: {
      companyName: 'TechCorp Solutions India',
      website: 'https://techcorp-india.example.com',
      industry: 'Information Technology & Services',
      location: 'Hyderabad, Telangana, India',
      aboutCompany: 'TechCorp is an enterprise software provider innovating cloud and AI solutions.',
    },
  },
  // 3. Employer 2
  {
    name: 'Pooja Sundaram',
    email: 'hr@cloudscale.io',
    password: 'employerPassword123',
    role: 'employer',
    phone: '+91 9988776655',
    companyDetails: {
      companyName: 'CloudScale Technologies',
      website: 'https://cloudscale.example.io',
      industry: 'Cloud Computing & SaaS',
      location: 'Bengaluru, Karnataka, India',
      aboutCompany: 'CloudScale helps startups build scalable web infrastructure and modern cloud-native apps.',
    },
  },
  // 4. Job Seeker 1
  {
    name: 'Chigulla Gunith Sai Anjaneya',
    email: 'gunith.cse@gmail.com',
    password: 'seekerPassword123',
    role: 'job_seeker',
    phone: '+91 9123456780',
    profile: {
      headline: 'Passionate 2nd Year CSE Undergrad | Full Stack MERN Developer',
      bio: 'Enthusiastic computer science student skilled in building scalable web applications with MongoDB, Express, React, and Node.js.',
      skills: ['JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'React', 'Git', 'Data Structures', 'REST APIs'],
      education: [
        {
          institution: 'VNR Vignana Jyothi Institute of Engineering and Technology',
          degree: 'B.Tech in Computer Science and Engineering',
          yearOfPassing: 2028,
          gradeOrPercentage: '9.2 CGPA',
        },
      ],
      experience: [
        {
          company: 'Coding Club VNRVJIET',
          position: 'Technical Core Member',
          years: 1,
          description: 'Organized tech workshops and mentored juniors on Web Development and Git version control.',
        },
      ],
      resumeUrl: 'https://drive.google.com/file/d/sample-resume-gunith/view',
      githubUrl: 'https://github.com/Gunith08',
      linkedinUrl: 'https://linkedin.com/in/gunith-sai',
    },
  },
  // 5. Job Seeker 2
  {
    name: 'Ananya Verma',
    email: 'ananya.verma@example.com',
    password: 'seekerPassword123',
    role: 'job_seeker',
    phone: '+91 9001122334',
    profile: {
      headline: 'Frontend Engineer | React & TypeScript Enthusiast',
      bio: 'Junior web developer passionate about crafting beautiful, accessible, and high-performance user interfaces.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'Next.js', 'HTML5/CSS3'],
      education: [
        {
          institution: 'JNTU Hyderabad',
          degree: 'B.Tech in Information Technology',
          yearOfPassing: 2025,
          gradeOrPercentage: '8.8 CGPA',
        },
      ],
      experience: [
        {
          company: 'WebCraft Studio',
          position: 'Frontend Intern',
          years: 1,
          description: 'Built customer dashboards and integrated RESTful APIs.',
        },
      ],
      resumeUrl: 'https://drive.google.com/file/d/sample-resume-ananya/view',
      githubUrl: 'https://github.com/ananya-v',
      linkedinUrl: 'https://linkedin.com/in/ananya-verma',
    },
  },
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Application.deleteMany();
    await Job.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing database records.');

    // 1. Insert Users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`Inserted ${createdUsers.length} users (Admin, Employers, Job Seekers).`);

    const employer1 = createdUsers[1];
    const employer2 = createdUsers[2];
    const seeker1 = createdUsers[3];
    const seeker2 = createdUsers[4];

    // 2. Insert Jobs
    const sampleJobs = [
      {
        title: 'Junior Backend Developer (Node.js / Express)',
        description: 'We are looking for a motivated Backend Developer to build RESTful APIs, design MongoDB schemas, and handle authentication with JWT.',
        company: employer1.companyDetails.companyName,
        location: 'Hyderabad, India (Hybrid)',
        employmentType: 'Full-time',
        category: 'Software Development',
        experienceRequirement: 'Junior (1-3 yrs)',
        requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'REST API', 'JWT'],
        salary: { min: 600000, max: 900000, currency: 'INR', period: 'per annum' },
        openings: 2,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        jobStatus: 'Open',
        employer: employer1._id,
      },
      {
        title: 'Full Stack MERN Developer Intern',
        description: 'Great internship opportunity for 2nd / 3rd year engineering students with knowledge of React, Node.js, Express, and MongoDB.',
        company: employer1.companyDetails.companyName,
        location: 'Remote',
        employmentType: 'Internship',
        category: 'Software Development',
        experienceRequirement: 'Fresher',
        requiredSkills: ['JavaScript', 'React.js', 'Node.js', 'MongoDB', 'Git'],
        salary: { min: 25000, max: 40000, currency: 'INR', period: 'per month' },
        openings: 3,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        jobStatus: 'Open',
        employer: employer1._id,
      },
      {
        title: 'Frontend React Developer',
        description: 'Join CloudScale to build snappy web dashboards using React, Redux, and modern CSS frameworks.',
        company: employer2.companyDetails.companyName,
        location: 'Bengaluru, India',
        employmentType: 'Full-time',
        category: 'Software Development',
        experienceRequirement: 'Junior (1-3 yrs)',
        requiredSkills: ['React', 'JavaScript', 'HTML/CSS', 'Redux', 'REST APIs'],
        salary: { min: 700000, max: 1100000, currency: 'INR', period: 'per annum' },
        openings: 2,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        jobStatus: 'Open',
        employer: employer2._id,
      },
      {
        title: 'Cloud DevOps Engineer (AWS / Docker)',
        description: 'Responsible for CI/CD pipelines, container orchestration with Docker, and cloud deployments on AWS.',
        company: employer2.companyDetails.companyName,
        location: 'Bengaluru, India (Hybrid)',
        employmentType: 'Full-time',
        category: 'DevOps & Cloud',
        experienceRequirement: 'Mid-level (3-5 yrs)',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD Pipelines'],
        salary: { min: 1200000, max: 1800000, currency: 'INR', period: 'per annum' },
        openings: 1,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        jobStatus: 'Open',
        employer: employer2._id,
      },
    ];

    const createdJobs = await Job.insertMany(sampleJobs);
    console.log(`Inserted ${createdJobs.length} job postings.`);

    // 3. Insert Sample Applications
    const job1 = createdJobs[0];
    const job2 = createdJobs[1];
    const job3 = createdJobs[2];

    const sampleApplications = [
      {
        job: job1._id,
        applicant: seeker1._id,
        employer: employer1._id,
        resumeUrl: seeker1.profile.resumeUrl,
        coverLetter: 'Hello, I have strong hands-on experience building backend APIs in Node.js and MongoDB.',
        status: 'Shortlisted',
        applicantSnapshot: {
          name: seeker1.name,
          email: seeker1.email,
          phone: seeker1.phone,
          headline: seeker1.profile.headline,
          skills: seeker1.profile.skills,
        },
        statusHistory: [
          { status: 'Pending', note: 'Application submitted', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'Under Review', note: 'Resume shortlisted for review', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'Shortlisted', note: 'Profile looks very solid, scheduled technical round', changedAt: new Date() },
        ],
      },
      {
        job: job2._id,
        applicant: seeker1._id,
        employer: employer1._id,
        resumeUrl: seeker1.profile.resumeUrl,
        coverLetter: 'I would love to contribute as a MERN full-stack intern and expand my development skills.',
        status: 'Pending',
        applicantSnapshot: {
          name: seeker1.name,
          email: seeker1.email,
          phone: seeker1.phone,
          headline: seeker1.profile.headline,
          skills: seeker1.profile.skills,
        },
        statusHistory: [
          { status: 'Pending', note: 'Application submitted', changedAt: new Date() },
        ],
      },
      {
        job: job3._id,
        applicant: seeker2._id,
        employer: employer2._id,
        resumeUrl: seeker2.profile.resumeUrl,
        coverLetter: 'I specialize in React and modern UI development. Looking forward to discussing this opportunity.',
        status: 'Interviewing',
        applicantSnapshot: {
          name: seeker2.name,
          email: seeker2.email,
          phone: seeker2.phone,
          headline: seeker2.profile.headline,
          skills: seeker2.profile.skills,
        },
        statusHistory: [
          { status: 'Pending', note: 'Application submitted', changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { status: 'Shortlisted', note: 'Screened by HR', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'Interviewing', note: 'First technical round scheduled for tomorrow', changedAt: new Date() },
        ],
      },
    ];

    await Application.insertMany(sampleApplications);

    // Update applicants counts on the jobs
    await Job.findByIdAndUpdate(job1._id, { applicantsCount: 1 });
    await Job.findByIdAndUpdate(job2._id, { applicantsCount: 1 });
    await Job.findByIdAndUpdate(job3._id, { applicantsCount: 1 });

    console.log('Inserted sample job applications and synchronized applicant counts.');
    console.log('\n--- SAMPLE LOGIN CREDENTIALS ---');
    console.log('1. Admin: admin@jobportal.com / adminPassword123');
    console.log('2. Employer (TechCorp): recruiter@techcorp.in / employerPassword123');
    console.log('3. Employer (CloudScale): hr@cloudscale.io / employerPassword123');
    console.log('4. Job Seeker (Gunith): gunith.cse@gmail.com / seekerPassword123');
    console.log('5. Job Seeker (Ananya): ananya.verma@example.com / seekerPassword123');
    console.log('--------------------------------\n');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal');
    await Application.deleteMany();
    await Job.deleteMany();
    await User.deleteMany();
    console.log('All database data destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`Error deleting data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
