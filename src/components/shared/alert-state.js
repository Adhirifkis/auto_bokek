import React from "react";

export const AlertState = ({ success, error }) => {
  return (
    <>
      {error && (
        <div className="text-rose-500 text-sm bg-rose-50 p-2 rounded-md text-center text-balance font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="text-emerald-500 text-sm bg-emerald-50 p-2 rounded-md text-center text-balance font-medium">
          {success}
        </div>
      )}
    </>
  );
};
