import React from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const ThreeDotsMenu = ({ onRemove, onReset }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="p-0 m-0 focus:ring-0 focus:outline-none"
          style={{ background: "none", border: "none" }}
          onClick={(e) => {
            e.stopPropagation();  // Ensure button click doesn't propagate to Link
          }}
        >
          <MoreVertical className="h-3.5 w-3.5" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();  // Ensure event doesn't propagate to Link
            console.log("Remove clicked");
            onRemove();  // Call the remove function
          }}
        >
          Remove School
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();  // Ensure event doesn't propagate to Link
            console.log("Reset clicked");
            onReset();  // Call the reset function
          }}
        >
          Reset Price
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreeDotsMenu;
