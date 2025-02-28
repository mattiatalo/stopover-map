/* eslint-disable react/prop-types */

"use client";

import { Navbar } from "flowbite-react";
import LanguageDiv from "./LanguageDiv";
import { useLocalization } from "./LocalizationProvider";
import { RiInformation2Line } from "@remixicon/react";

export function SimpleNavbar({ toggleModal }) {
  const { language } = useLocalization();
  
  const handleClick = (e) => {
    e.preventDefault();
    toggleModal();
  }

  return (
    <Navbar fluid className="p-3 shadow-md bg-[#191919] z-[80] w-full">
      <div id="link-1880-19" className="ct-link flex items-center text-[#fff]" href="https://globalsearoutes.net/">

        <a href="https://globalsearoutes.net/" target="_blank">
          <img 
            id="image-1886-385" alt="" 
            src="/logo-no-testo.png" 
            className="ct-image w-10"
          />
        </a>

        {/* <img 
          id="image-1886-385" alt="" 
          src="/logo-comune-white.png" 
          className="ct-image w-12 h-16"
        /> */}
        { language !== "it" ? <h3 className="md:text-xl mx-3 font-bold text-[16px] md:w-auto w-[70%]"> GeoChronicles of the Novara: <span className="font-normal">Mapping the 1857–1859 Expedition</span> </h3>
        : <h3 className="md:text-xl mx-3 font-bold text-[16px] md:w-auto w-[70%]">Mappatura georeferenziata della spedizione della Novara <span className="font-normal"> (1857-1859)</span> </h3> }      
      </div>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <a  href="https://globalsearoutes.net/the-project/" onClick={handleClick} className="rounded-full border-[#AD9A6D] border-[1px] zoom-in p-1 px-2">
          <RiInformation2Line className="text-[#AD9A6D] "/>
        </a>
        <LanguageDiv />
      </Navbar.Collapse>

      
    </Navbar>
  );
}
