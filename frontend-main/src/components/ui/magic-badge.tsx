import React from "react";

interface Props {
  title: string;
}

const MagicBadge = ({ title }: Props) => {
  return (
    <div className="z-10 flex min-h-32 items-center justify-center">
      <span className="py-2 px-5 text-sm font-medium bg-white rounded-full border border-gray-200 dark:bg-background">
        {title}
      </span>
    </div>
  );
};

export default MagicBadge;
