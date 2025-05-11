import {useState } from "react";
import { Button } from "./ui/button";
import { Save } from "lucide-react";


export const CreatePageSidebar = (onSaveClick : void) => {
    const [isSidebarOpen] = useState(true);
    return (
        <div
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >

        <div className="flex-1 overflow-y-auto p-4">
          {isSidebarOpen && (
        <ul className="space-y-4">
          {/* User guide on how to create node */}
          <li>
            <h3 className="text-sm font-semibold">How to create a node:</h3>
            <p className="text-xs text-gray-400">
              Click on any node to open the node's details and click on the + button to create a new node.
              <br />
              <br />
              - Wallet node, can only either create new token or LST nodes.<br />
              <br />
              - Token nodes, can create new protocol or LST nodes.<br />
              <br />
              - LST nodes, can create new protocol or token nodes.<br />
              <br />
              - Protocol nodes, can't create any new nodes.<br />
            </p>
          </li>

          

          <li>
          <h3 className="text-sm font-semibold">How to delete a node:</h3>
            <p className="text-xs text-gray-400 flex">
              Click on any node to open the node's details and click on the 🗑️ button to delete the node.

              <br />
              <br />
              - Deleting a node will also delete all the nodes that are connected from it.<br />
              <br />
              <br />
              - You can't delete the Wallet node.<br />
              <br />
              <br />
            </p>
          </li>

          <li>
          <h3 className="text-sm font-semibold">Now that you know the basics, good luck and have fun creating your own strategies 😁!!</h3>
          <br />
          <br />
          </li>
          <li>
            <Button
              variant="outline"
          className="w-full text-left p-2 rounded-md hover:bg-accent"
          onClick={() => onSaveClick}
            >
              <Save className="mr-2" />
              Save Strategy
            </Button>
          </li>
        </ul>
          )}
        </div>
      </div>
    );
    }