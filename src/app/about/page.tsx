import { FaGithub, FaInstagram, FaTelegram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { NextPage } from "next";

const FAQ = dynamic(() => import("@/components/sections/About/FAQ"));

export const metadata: Metadata = {
  title: `About | ${siteConfig.name}`,
};

const AboutPage: NextPage = () => {
  const socialLinks = [
    {
      name: "GitHub",
      icon: <FaGithub size={30} />,
      url: "https://github.com/satyamrojhax"
    },
    {
      name: "Instagram",
      icon: <FaInstagram size={30} />,
      url: "https://instagram.com/satyamrojhax"
    },
    {
      name: "Telegram",
      icon: <FaTelegram size={30} />,
      url: "https://t.me/satyamrojha"
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={30} />,
      url: "https://linkedin.com/in/satyamrojhax"
    },
    {
      name: "X (Twitter)",
      icon: <FaXTwitter size={30} />,
      url: "https://x.com/satyamrojhax"
    }
  ];

  return (
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-4xl flex-col gap-8 py-8">
        {/* Developer Name Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Satyam RojhaX
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Software Engineer & Full Stack Developer
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center items-center gap-6">
          {socialLinks.map((social) => (
            <Link 
              key={social.name}
              target="_blank" 
              href={social.url}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label={social.name}
            >
              {social.icon}
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <Suspense>
          <FAQ />
        </Suspense>
      </div>
    </div>
  );
};

export default AboutPage;
