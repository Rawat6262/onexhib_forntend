import { Routes, Route } from "react-router-dom";
import SignupForms from "./Component/Signup2";
import Dashboard from "./Admin/Dashboard.admin";
import Organiser from "./Component/Organiser";
import Products from "./Component/Products";
import Company from "./Component/Company";
import LoginForms from "./Component/login";
import AdminOrganiser from "./Admin/Organiser.admin";
import AdminCompany from "./Admin/Company.admin";
import AdminProducts from "./Admin/Products.admin";
import { Toaster } from 'sonner';
import { useEffect } from "react";
import User from "./Component/User";
import CompanyDetail from "./Component/Products";
import AdminDashboard from "./Admin/Dashboard.admin";
import axios from "axios";

let role = 'NORMAL';

export default function App() {
  // let fetchdata = ()=>{
    
  // }
  // useEffect(()=>{
    
  // },[])
  return (
    <>
    
        <Routes>
          <Route path="/" element={<LoginForms />} />
          <Route path="/api/Signup" element={<SignupForms />} />
          <Route path="/api/Company" element={<Company />} />
          <Route path="/api/organiser" element={<Organiser />} />
          <Route path="/organiser/:id" element={<User/>} />
          <Route path="/company/:id" element={<CompanyDetail />} />
          <Route path="/api/admin/dashboard" element={<AdminDashboard/>} />
          <Route path="/api/admin/organiser" element={<AdminOrganiser />} />
          <Route path="/organiser/:id" element={<User/>} />
          <Route path="/api/Admin/Company" element={<AdminCompany />} />
          <Route path="/api/Admin/Products" element={<AdminProducts />} />
            <Route path="/company/:id" element={<CompanyDetail />} />
        </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}
