
"use client";

import { Navbar } from "flowbite-react";
import { CloudLightning, Layers, Map, MapPin, Menu, Search } from "lucide-react";

export function SimpleNavbar() {
  return (
    <Navbar fluid className="p-3 shadow-md bg-[#191919] z-50 w-full">
      <a id="link-1880-19" className="ct-link flex" href="https://globalsearoutes.net/">

        <img 
          id="image-1886-385" alt="" 
          src="https://globalsearoutes.net/wp-content/uploads/2022/08/logo-no-testo.png" 
          className="ct-image w-10"
        />

        {/* <img 
          id="image-1886-385" alt="" 
          src="/logo-comune-white.png" 
          className="ct-image w-12 h-16"
        /> */}

       
      </a>
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
    </Navbar>
  );
}
