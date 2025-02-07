
"use client";

import { Navbar } from "flowbite-react";
import { CloudLightning, Layers, Map, MapPin, Menu, Search } from "lucide-react";
import LanguageDiv from "./LanguageDiv";
import { useLocalization } from "./LocalizationProvider";

export function SimpleNavbar() {
  const { language } = useLocalization();

  return (
    <Navbar fluid className="p-3 shadow-md bg-[#191919] z-50 w-full">
      <div id="link-1880-19" className="ct-link flex items-center text-[#fff]" href="https://globalsearoutes.net/">

        <img 
          id="image-1886-385" alt="" 
          src="/logo-no-testo.png" 
          className="ct-image w-10"
        />

        {/* <img 
          id="image-1886-385" alt="" 
          src="/logo-comune-white.png" 
          className="ct-image w-12 h-16"
        /> */}
        { language !== "it" ? <h3 className="text-xl mx-3 font-bold"> GeoChronicles of the Novara: <span className="font-normal">Mapping the 1857–1859 Expedition</span> </h3>
        : <h3 className="text-xl mx-3 font-bold">Mappatura georeferenziata della spedizione della Novara <span className="font-normal"> (1857-1859)</span> </h3> }      
      </div>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <div className="button-list flex space-x-4 hidden">
          <button className="rounded-full shadow-round p-3 hover:bg-gray-100 shadow-lg">
            <Menu  color="#1A56AE" size={25}/>
          </button>

          <button className="rounded-full shadow-round p-3 hover:bg-gray-100">
            <Layers  color="#1A56AE" size={25}/>
          </button>

          <button className="rounded-full shadow-round p-3 hover:bg-gray-100">
            <Map  color="#1A56AE" size={25}/>
          </button>

          <button className="rounded-full shadow-round p-3 hover:bg-gray-100">
            <MapPin  color="#1A56AE" size={25}/>
          </button>

          <button className="rounded-full shadow-round p-3 hover:bg-gray-100">
            <CloudLightning  color="#1A56AE" size={25}/>
          </button>

          <button className="rounded-full shadow-round p-3 hover:bg-gray-100">
            <Search  color="#1A56AE" size={25}/>
          </button>

        </div>

        {/* <Navbar.Link href="#" active>
          Navigator
        </Navbar.Link>
        <Navbar.Link  href="#">
          About
        </Navbar.Link>
        <Navbar.Link href="#">Services</Navbar.Link>
        <Navbar.Link href="#">Pricing</Navbar.Link>
        <Navbar.Link href="#">Contact</Navbar.Link> */}
      </Navbar.Collapse>

      <LanguageDiv />
    </Navbar>
  );
}
