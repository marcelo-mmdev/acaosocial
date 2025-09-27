'use client'
//import Login from "@/login/page";
//import axios from "axios";
import { useState } from "react";
import LoginPage from "../login/page";


export default function Home() {

  const [data, setData] = useState('')
  const [horainicio, setHoraInicio] = useState('')
  const [horafinal, setHoraFinal] = useState('')

  

  return (
    <>
      <LoginPage />
    </>
  );
}
