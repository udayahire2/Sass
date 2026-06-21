import {  Menu } from "lucide-react";
import { MenuItem, MenuPopup, MenuTrigger } from "../ui/menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";

const UserMenu = () => {
  return (
    <>
      <Menu>
        <MenuTrigger
          render={
            <Avatar>
              <AvatarImage
                alt="udayahire"
                src={""}
              />
              <AvatarFallback>UA</AvatarFallback>
            </Avatar>
          }
        ></MenuTrigger>
        <MenuPopup>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Create Own Notes</MenuItem>
            <MenuItem><Button variant="destructive">Logout</Button></MenuItem>
        </MenuPopup>
      </Menu>
    </>
  );
};

export default UserMenu;
