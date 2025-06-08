import React from "react";


const NewletterBox = () => {
    const submitHandle = () =>{
         event.preventDefault()
    }
  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3 ">Stay updated with our latest news and offers</p>
      <form onSubmit={submitHandle} className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3">
        <input
          className=" w-full sm:flex-1 outline-none"
          type="email"
          placeholder="Enter your email"
          required
        ></input>
        <button type="submit" className="bg-black text-white text-xs px-10 py-4">Subscribe</button>
      </form>
    </div>
  );
};

export default NewletterBox;
