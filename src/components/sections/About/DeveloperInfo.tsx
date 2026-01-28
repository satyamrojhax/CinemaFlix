"use client";

import { 
  FaGithub, 
  FaInstagram, 
  FaTelegram, 
  FaLinkedin, 
  FaXTwitter,
  FaEnvelope,
  FaCode,
  FaHeart,
  FaStar
} from "react-icons/fa6";
import { Link, Card, CardBody, CardHeader } from "@heroui/react";

const DeveloperInfo = () => {
  const socialLinks = [
    {
      name: "GitHub",
      icon: <FaGithub className="size-5" />,
      url: "https://github.com/satyamrojhax",
      username: "satyamrojhax"
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="size-5" />,
      url: "https://instagram.com/satyamrojhax",
      username: "satyamrojhax"
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="size-5" />,
      url: "https://t.me/satyamrojha",
      username: "satyamrojha"
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin className="size-5" />,
      url: "https://linkedin.com/in/satyamrojhax",
      username: "satyamrojhax"
    },
    {
      name: "X (Twitter)",
      icon: <FaXTwitter className="size-5" />,
      url: "https://x.com/satyamrojhax",
      username: "satyamrojhax"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Developer Profile Card */}
      <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600">
        <CardHeader className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <FaCode className="text-blue-500" size={24} />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Developer Info
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              SR
            </div>
            <div>
              <h3 className="text-xl font-semibold">Satyam RojhaX</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Full Stack Developer & Content Creator
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Passionate developer creating amazing web experiences and streaming solutions. 
            Specialized in React, Next.js, and modern web technologies. Always open to 
            collaborations and interesting projects.
          </p>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">
              <FaStar className="text-blue-500" size={12} />
              <span>React</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full text-sm">
              <FaStar className="text-green-500" size={12} />
              <span>Next.js</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-sm">
              <FaStar className="text-purple-500" size={12} />
              <span>TypeScript</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 rounded-full text-sm">
              <FaStar className="text-orange-500" size={12} />
              <span>Tailwind CSS</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Social Links Card */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FaEnvelope className="text-purple-500" />
            Connect With Me
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.url}
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="text-gray-700 dark:text-gray-300">
                  {social.icon}
                </div>
                <div>
                  <p className="font-medium">{social.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{social.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Contact Information Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
            <FaHeart className="text-red-500" />
            <span>Need Source Codes or API Configuration?</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Feel free to reach out for collaborations, source code requests, or API configuration help. 
            I'm always excited to work on new projects and help fellow developers!
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://instagram.com/satyamrojhax"
              target="_blank"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              Contact on Instagram
            </Link>
            <Link
              href="https://t.me/satyamrojha"
              target="_blank"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105"
            >
              Message on Telegram
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardBody className="space-y-3">
          <h4 className="font-semibold text-lg">About CinemaFlix</h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            CinemaFlix is a modern streaming platform built with cutting-edge web technologies. 
            This project showcases advanced development skills including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
            <li>Responsive design with Tailwind CSS</li>
            <li>Modern React patterns with Next.js 14</li>
            <li>TypeScript for type safety</li>
            <li>Integration with TMDB API</li>
            <li>Advanced state management</li>
            <li>Optimized performance and SEO</li>
            <li>Dark/Light theme support</li>
            <li>Mobile-first responsive design</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Built with <FaHeart className="inline text-red-500" size={12} /> by Satyam RojhaX
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default DeveloperInfo;
