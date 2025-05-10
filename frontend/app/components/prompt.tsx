import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";

type PromptProps = {
  content: React.ReactNode;
  onResolve: (value: boolean) => void;
};

const Prompt: React.FC<PromptProps> = ({ content, onResolve }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = (result: boolean) => {
    setVisible(false);
    setTimeout(() => onResolve(result), 200);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div
        className={`transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        } absolute inset-0 bg-opacity-0`}
        onClick={() => handleClose(false)}
      />
      <div
        className={`z-10 transition-all duration-300 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } bg-white rounded-2xl border border-gray-400 shadow-xl w-full max-w-sm overflow-hidden`}
      >
        {content}
        <div className="flex border-t">
          <button
            onClick={() => handleClose(false)}
            className="w-1/2 py-3 cursor-pointer text-red-600 font-semibold hover:bg-gray-50 transition border-r border-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={() => handleClose(true)}
            className="w-1/2 py-3 cursor-pointer text-blue-600 font-semibold hover:bg-gray-50 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const promptUser = (content: React.ReactNode): Promise<boolean> => {
  return new Promise((resolve) => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const root = createRoot(div);

    const handleResolve = (value: boolean) => {
      root.unmount();
      div.remove();
      resolve(value);
    };

    root.render(<Prompt content={content} onResolve={handleResolve} />);
  });
};