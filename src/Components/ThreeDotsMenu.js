import React from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button"



const ThreeDotsMenu = ({onRemove, onReset }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="h-8 w-8">
            <MoreVertical className="h-3.5 w-3.5" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRemove}>Remove School</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onReset}>Reset Price</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

export default ThreeDotsMenu;
