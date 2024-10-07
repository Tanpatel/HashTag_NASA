# May 2024 SolarFlare Explorer

## Project Overview

SolarFlare Explorer is an interactive 3D visualization of solar flare activity and its impact on Earth's magnetosphere, created for the NASA Space Apps 2024 Challenge. This hackathon, held over 48 hours, challenged teams to utilize NASA data to develop innovative solutions that educate the public about space weather events, specifically the solar storms that occurred in May 2024.

## Features

- **3D Solar System Model**: Built using Three.js, featuring an accurate representation of solar flare trajectories and their interaction with Earth's magnetosphere.
- **Efficient Particle Simulation**: Optimized algorithms for simulating proton and plasma ejections, balancing accuracy with smooth performance in web browsers.
- **Data Sonification**: Conversion of ESP irradiance data from May 10-14, 2024, into musical notes using an F# 3 octaves harp, creating an auditory representation of solar activity.
- **Recordings of Solar Activity**: Incorporation of recordings from NASA's Solar Dynamics Observatory during the intense solar activity period from May 10 to 14, 2024, enhancing the visual narrative of solar flares and their effects on Earth.
- **Educational Focus**: Designed to engage and inform young space enthusiasts about solar flares and their effects on Earth.

## Technical Highlights

- Simplified trajectory equations for solar particles and their interactions with Earth's magnetosphere.
- Optimized for web browser performance while maintaining simulation accuracy.
- Creative use of NASA data to generate both visual and auditory representations of solar events.

## Tech Stack

* **Three.js**: A JavaScript library used for creating and displaying animated 3D computer graphics in a web browser.
* **JavaScript**: Used in both data representation and 3D model computations.
* **HTML/CSS**: Used for structuring and representing the web application.
* **NASA APIs**: Leveraged for accessing real-time data from NASA's Solar Dynamics Observatory and other relevant missions.

## Limitations

- Planet sizes and distances are not to scale to enhance visual appeal and performance.
- Aurora and detailed magnetosphere changes were omitted due to computational constraints.

## Target Audience

Young space enthusiasts with internet access, aiming for maximum accessibility and engagement with less resources.

## Requirements

* **Browser Compatibility**: The project is best viewed in modern browsers. Please ensure your browser is up to date for optimal performance.
* **Background Music Autoplay Restrictions**:
  Due to autoplay restrictions in some browsers, background music may not play automatically when loading the 3D model. Users may need to enable audio playback first

## How to Use

You can access our project through GitHub Pages at [GitHub Pages Link](https://tanpatel.github.io/HashTag_NASA/).

## Future Improvements

- Enhance accuracy of planet sizes and distances without compromising performance.
- Implement more detailed magnetosphere and aurora visualizations.
- Expand the range of solar events and their impacts represented in the model.

## Mathematical Framework for Solar-Terrestrial Particle Dynamics

The following equations form the core of our model, describing the journey of solar particles from the Sun to Earth's magnetosphere:

1. **Particle Motion in Magnetic Fields**:

   - Radius of Curvature:
     $$
     r = \frac{mv}{qB}
     $$
   - Period of Circular Motion:
     $$
     T = \frac{2\pi m}{qB}
     $$
   - Pitch of Helical Motion:
     $$
     p = v_{para} T
     $$
2. **Solar Wind and Orbital Dynamics**:

   - Orbital Velocity:
     $$
     v = \sqrt{\frac{GM}{R}}
     $$
   - Kepler's Third Law:
     $$
     \frac{T^2}{R^3} = \frac{4\pi^2}{GM}
     $$
   - Solar Wind Pressure:
     $$
     P_{sw} = \rho v^2
     $$
3. **Earth's Magnetosphere**:

   - Dipole Magnetic Field:
     $$
     B(r,λ) = \frac{B_0}{r^3}\sqrt{1 + 3\sin^2λ}
     $$
   - Magnetopause Standoff Distance:
     $$
     R_{mp} = \left(\frac{B_E^2}{2μ_0 P_{sw}}\right)^{1/6} R_E
     $$
4. **Particle-Field Interactions**:

   - Lorentz Force:
     $$
     \vec{F} = q(\vec{E} + \vec{v} \times \vec{B})
     $$
   - Path Length in Turbulent Field:
     $$
     L = \int \sqrt{1 + \left(\frac{\delta B_x}{B_0}\right)^2 + \left(\frac{\delta B_y}{B_0}\right)^2} ds
     $$

## Team Name: Hashtag

* **Tanha Patel**: 4th Year Computer Science Honours [LinkedIn Profile](https://www.linkedin.com/in/tanha-patel-0691ab22a/)
* **Krisha Bhalala**: 3rd Year Computer Science Honours [LinkedIn Profile](https://www.linkedin.com/in/krisha-bhalala-b2298323a/)
* **Hrutil Patel**: 4th Year Computer Science Honours [LinkedIn Profile](https://www.linkedin.com/in/hrutil-patel-1a7a08260/)
* **Krish Bhalala**: 3rd Year Computer Science Honours [LinkedIn Profile](https://www.linkedin.com/in/krishbhalala/)

## Acknowledgments

- NASA Space Apps Challenge for the inspiration and data resources.
- Dr. Philip Ferguson, Ph.D. P.Eng. (Professor) & (Local Event Lead)

## License

This project is licensed under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of this software as long as you include the original copyright notice and permission notice in all copies or substantial portions of the software. The software is provided "as is", without warranty of any kind.
