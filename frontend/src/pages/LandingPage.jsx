// import React, { useEffect, useState } from "react";
// // eslint-disable-next-line no-unused-vars
// import { motion } from "framer-motion";

// export default function LandingPage() {
//   const [animateUp, setAnimateUp] = useState(false);

//   // Wait for the dog animation to run (~2.5s), then show products
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setAnimateUp(true);
//     }, 2500); // 2.5 seconds before revealing products
//     return () => clearTimeout(timer);
//   }, []);

//   const products = [
//     { id: 1, name: "Dog Toy", price: "$10" },
//     { id: 2, name: "Dog Food", price: "$25" },
//     { id: 3, name: "Dog Bed", price: "$40" },
//     { id: 4, name: "Leash", price: "$12" },
//     { id: 5, name: "Collar", price: "$8" },
//     { id: 6, name: "Treats", price: "$6" },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10">
//       {/* Dog animation (centered) */}
//       <motion.img
//         src="/image.png"
//         alt="dog"
//         initial={{ y: 0, scale: 1 }}
//         animate={{ y: -150, scale: 0.8 }} // run immediately on mount
//         transition={{ duration: 2.5, ease: "easeInOut" }}
//         className="rounded-full shadow-xl"
//         loading="lazy"
//       />

//       {/* Product list: hidden until animateUp is true */}
//       {animateUp && (
//         <motion.div
//           className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl p-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           {products.map((p) => (
//             <div
//               key={p.id}
//               className="bg-white p-6 rounded-2xl shadow-md text-center"
//             >
//               <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
//               <p className="text-gray-600">{p.price}</p>
//             </div>
//           ))}
//         </motion.div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function LandingPage({ keycloak }) {
  const [animateUp, setAnimateUp] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Wait for the dog animation to run (~2.5s), then show products
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateUp(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // const products = [
  //   { id: 1, name: "Dog Toy", price: "$10" },
  //   { id: 2, name: "Dog Food", price: "$25" },
  //   { id: 3, name: "Dog Bed", price: "$40" },
  //   { id: 4, name: "Leash", price: "$12" },
  //   { id: 5, name: "Collar", price: "$8" },
  //   { id: 6, name: "Treats", price: "$6" },
  // ];

  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  const handleAddButtonClick = () => {
    setClicked(true);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 relative">

      {/* 🔴 Logout Button (top-right) */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>

      {/* Dog animation */}
      <motion.img
        src="/image.png"
        alt="dog"
        initial={{ y: 0, scale: 1 }}
        animate={{ y: -150, scale: 0.8 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="rounded-full shadow-xl"
        loading="lazy"
      />

      {/* Product list */}
      {animateUp && (
        <motion.div
          className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* {products.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-2xl shadow-md text-center"
            >
              <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
              <p className="text-gray-600">{p.price}</p>
            </div>
          ))} */}
          <ProductListingPage />
        </motion.div>
      )}

      <button onClick={handleAddButtonClick}>Add Product</button>
      {clicked && <AddProductPage />}
    </div>
  );
}

