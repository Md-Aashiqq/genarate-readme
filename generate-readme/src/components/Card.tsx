import React, { useState } from "react";

interface cardProps {
  children?: React.ReactNode;
}

const Card = ({ children }: cardProps) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPos({ x, y });
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <div
      className={"github-card"}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundPosition: `${pos.x}px ${pos.y}px`,
        transform: `perspective(1000px) rotateX(${pos.y / 30}deg) rotateY(${
          -pos.x / 30
        }deg)`, // Reduce the rotation effect
      }}
    >
      {children ? (
        children
      ) : (
        <>
          <h2 className={"title"}>Hello, Animation!</h2>
          <p className={"content"}>
            This card follows your cursor with a cool animation!
          </p>
        </>
      )}
    </div>
  );
};

export default Card;
