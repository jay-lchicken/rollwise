"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { QrCode, Users, CheckCircle, Clock, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn]);

  const features = [
    { icon: Clock, title: "Lightning Fast", desc: "Take attendance in seconds" },
    { icon: QrCode, title: "QR Scanning", desc: "Modern QR code technology" },
    { icon: Users, title: "Team Ready", desc: "Perfect for any group size" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500" />
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div
          className={`text-center space-y-8 max-w-4xl mx-auto transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
              RollWise
            </h1>
            <div className="flex items-center justify-center space-x-2 text-purple-300">
              <Zap className="w-5 h-5" />
              <span className="text-xl font-medium">Powered by Innovation</span>
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
            Transform attendance tracking from a chore into a
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-semibold">
              {" "}
              seamless experience
            </span>
          </p>

          <div className="grid md:grid-cols-3 gap-6 my-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                  isVisible ? "animate-pulse" : ""
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <SignInButton mode="modal">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 font-semibold text-lg transform hover:scale-105 hover:-translate-y-1 min-w-[200px]">
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Get Started</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </SignInButton>

            <button
              onClick={() => alert("Just scan the qr code with your phone's camera app or a software!")}
              className="group relative px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-2xl shadow-xl hover:bg-white/20 transition-all duration-300 font-semibold text-lg border border-white/20 transform hover:scale-105 hover:-translate-y-1 min-w-[200px]"
            >
              <span className="flex items-center justify-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>Quick Scan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </button>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              Join thousands of educators making attendance effortless
            </p>
            <div className="flex justify-center space-x-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}