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
      <div id="link-1880-19" className="ct-link flex items-center text-[#fff] flex-1 justify-evenly" href="https://globalsearoutes.net/">

        <a href="https://globalsearoutes.net/" target="_blank" className="flex mr-4">
          <img 
            id="image-1886-385" alt="" 
            src="/logo-no-testo.png" 
            className="ct-image md:w-10 w-14"
          />
        </a>

        {/* <img 
          id="image-1886-385" alt="" 
          src="/logo-comune-white.png" 
          className="ct-image w-12 h-16"
        /> */}
        { language !== "it" ? <h3 className="md:text-xl mx-3 font-bold text-[15px] md:w-auto w-[60%]"> GeoChronicles of the Novara: <span className="font-normal">Mapping the 1857–1859 Expedition</span> </h3>
        : <h3 className="md:text-xl mx-3 font-bold text-[15px] md:w-auto w-[60%]">Mappatura georeferenziata della spedizione della Novara <span className="font-normal"> (1857-1859)</span> </h3> }      
      </div>

      <Navbar.Toggle className="top-0 text-2xl text-white focus:bg-transparent  hover:bg-transparent zoom-in"/>

      <Navbar.Collapse className="items-end">

        <div className="flex gap-2 justify-end">
          <a  href="https://globalsearoutes.net/the-project/" onClick={handleClick} className="rounded-full border-[#AD9A6D] border-[1px] zoom-in p-1 px-2">
            <RiInformation2Line className="text-[#AD9A6D] "/>
          </a>
          <LanguageDiv />
        </div>
        
      </Navbar.Collapse>

      
    </Navbar>
  );
}
