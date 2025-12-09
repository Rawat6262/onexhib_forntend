import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Users, User, Package } from "lucide-react"; // added icons
import logo from "../assets/Untitled-2-01 1.png";
import logo2 from "../assets/Ellipse 14.png";
import ProfilePopup from "./Menupopup";

export default function VerticalMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);

  const menuItems = [
    { label: "Organiser", path: "/api/Organiser", icon: <Users size={20} /> },
   
  ];

  return (
    <div className={`h-screen ${isOpen ? "w-[256px]" : "w-20"}`}>
    <div
      className={`fixed top-0 left-0 h-screen bg-[#131C55] flex flex-col border-r-2 transition-all duration-300 z-50
        ${isOpen ? "w-[256px]" : "w-20"}
      `}
    >
      {/* Header / Logo */}
      <div className="h-16 bg-[#0E1B6B] flex items-center justify-between px-4">
        {isOpen && (
          <img src={logo} alt="Logo" className="h-10 object-contain" />
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:opacity-80"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col gap-3 px-4 py-6 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="text-white text-lg flex items-center gap-3 hover:bg-[#0E1B6B] rounded-lg px-3 py-2 transition"
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="flex items-center gap-3 px-4 py-4 bg-[#0E1B6B]" onClick={()=>setIsOpen2(true)} >
        <img src={logo2} alt="User Avatar" className="w-10 h-10 rounded-full" />
       <ProfilePopup open={isOpen2} onClose={() => setIsOpen2(false)} />

        {isOpen && (
          <div className="text-white text-sm">
            <p className="font-bold">Tim Cook</p>
            <p className="opacity-80">timcook@force.com</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
