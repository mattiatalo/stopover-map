/* eslint-disable react/prop-types */
import { Map } from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { forwardRef } from "react";

const accessToken = 'pk.eyJ1IjoiZGF1ZGk5NyIsImEiOiJjanJtY3B1bjYwZ3F2NGFvOXZ1a29iMmp6In0.9ZdvuGInodgDk7cv-KlujA';
export default forwardRef(function MainMap(props, ref) {
  const onLoad = (event) => {
    console.log(event);
    // event.target.setFog({}); 
  }

  return (
    <Map
      mapboxAccessToken={accessToken}
      initialViewState={{
        // longitude: 16.45,
        // latitude: 69.76,

        latitude:31.2,
        longitude:17.13,
        zoom: 1.8
      }}
      ref={ref}
      onLoad={onLoad}
      projection={props.projection}
      style={{ width: "100%", height: "calc(100vh - 90px)"}}
      mapStyle={"mapbox://styles/daudi97/cm4edalgs01ln01sibv3t8wlt"}
      // mapStyle={props.basemap == "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/outdoors-v11"}
    >
      {props.children}
    </Map>
  )
})
