const defaultVehicles = [
  { name: 'Tata Ace (Chota Hathi)', capacity: '850kg', dimensions: '7FT X 4.5FT X 5FT', img: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Tata_Ace.jpg' },
  { name: 'Mahindra Bolero Pickup', capacity: '1.5 Ton', dimensions: '8.2FT X 5FT X 5.5FT', img: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Mahindra_Bolero_Pick-Up.jpg' },
  { name: 'Ashok Leyland Dost', capacity: '1.8 Ton', dimensions: '8.2FT X 5.3FT X 5.5FT', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Ashok_Leyland_Dost_Li-Ion.jpg' },
  { name: 'Tata 407', capacity: '2.5 Ton', dimensions: '9FT X 5.5FT X 6FT', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Tata_407_truck.jpg' },
  { name: 'Force Shaktiman', capacity: '3.5 Ton', dimensions: '11FT X 6.5FT X 7FT', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Force_Shaktiman_400.jpg' },
  { name: 'Eicher Pro 2049', capacity: '4 Ton', dimensions: '10.4FT X 6.7FT X 7FT', img: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Eicher_Pro_2049.jpg' },
  { name: 'Eicher Pro 2095', capacity: '5.5 Ton', dimensions: '14FT X 7FT X 7.5FT', img: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Eicher_Pro_3015.jpg' },
  { name: '19 Feet Container', capacity: '7.5 Ton', dimensions: '19FT X 7.5FT X 7.5FT', img: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Container_on_truck.jpg' },
  { name: '20 Feet Container', capacity: '9.5 Ton', dimensions: '20FT X 8FT X 8FT', img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Shipping_container_truck_front_view.jpg' },
  { name: '32 Feet Container', capacity: '15 Ton', dimensions: '32FT X 8FT X 8FT', img: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Intermodal_container_on_flatbed.jpg' },
  { name: 'Ashok Leyland 3718', capacity: '25 Ton', dimensions: '28FT X 8FT X 8.5FT', img: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Semi-trailer_truck_on_highway.jpg' },
  { name: 'Tata Prima 4923', capacity: '40 Ton', dimensions: '40FT X 8FT X 8.5FT', img: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Delivery_truck_front_left.jpg' },
  { name: 'Mahindra Alfa Cargo', capacity: '500kg', dimensions: '5FT X 4FT X 4.5FT', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Piaggio_Ape_in_India.jpg' },
  { name: 'Piaggio Ape Xtra', capacity: '600kg', dimensions: '5.5FT X 4.2FT X 4.8FT', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Piaggio_Ape_Xtra_LD.jpg' },
  { name: 'Champion 3-Wheeler', capacity: '550kg', dimensions: '5.2FT X 4FT X 4.6FT', img: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Ape_Calessino_-_Flickr_-_m.prinke.jpg' },
  { name: 'Maruti Suzuki Super Carry', capacity: '740kg', dimensions: '7FT X 4.8FT X 5.2FT', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Suzuki_Carry_1.5_Flat_Deck_2019_front.jpg' },
  { name: 'Mahindra Supro Maxitruck', capacity: '1.0 Ton', dimensions: '8.2FT X 5FT X 5.2FT', img: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Mahindra_Bolero_Maxitruck_Plus.jpg' }
];

exports.getVehicles = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: defaultVehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles list",
      error: error.message
    });
  }
};
