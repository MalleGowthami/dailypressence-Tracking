import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiCheckCircle, FiUsers } from "react-icons/fi";

const Intro = () => {
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Feature cards data
  const features = [
    {
      icon: <FiCalendar size={32} />,
      title: "Easy Tracking",
      description: "Log and monitor your attendance with a sleek calendar interface.",
    },
    {
      icon: <FiCheckCircle size={32} />,
      title: "Real-Time Updates",
      description: "Mark your status instantly and get immediate feedback.",
    },
    {
      icon: <FiUsers size={32} />,
      title: "Student-Friendly",
      description: "Designed specifically for B.Tech students' needs.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div
        className="max-w-5xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-4 tracking-tight"
          variants={itemVariants}
        >
          Attendance Tracker
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed"
          variants={itemVariants}
        >
          A smart, calendar-based system crafted for B.Tech students to effortlessly manage and track attendance in real-time.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12" variants={itemVariants}>
          <Link to="/login">
            <motion.button
              className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-full text-lg font-semibold hover:bg-blue-50 hover:border-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Register
            </motion.button>
          </Link>
        </motion.div>

        {/* Feature Cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" variants={containerVariants}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex justify-center mb-4 text-blue-600">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Subtle Call-to-Action */}
        <motion.p
          className="text-gray-500 text-sm italic"
          variants={itemVariants}
        >
          Join thousands of students managing their attendance effortlessly!
        </motion.p>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full opacity-20 blur-3xl -translate-x-1/2 translate-y-1/4"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-300 rounded-full opacity-20 blur-3xl translate-x-1/4 -translate-y-1/4"></div>
      </div>
    </div>
  );
};

export default Intro;
