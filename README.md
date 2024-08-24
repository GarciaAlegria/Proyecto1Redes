# Xmpp Client Project
This project aims to develop an XMPP client that is guided based on the configurations established by the protocol provided by the teacher and requires that it have some web or mobile interface. Some main objectives of the project are:
  - Implement a standards-based protocol: create communication that follows specific, globally agreed upon rules, ensuring interoperability and security. In the context of XMPP (Extensible Messaging and Presence Protocol), this means developing real-time messaging and presence capabilities that meet defined standards. This ensures that the implementation is compatible with other systems and devices that also use XMPP.
  - Understand the purpose of the XMPP protocol: The XMPP protocol is designed to facilitate instant messaging, online presence, and real-time communication. Its purpose is to allow efficient and secure communication between users, offering a decentralized system that supports data transfer in a flexible and extensible way. XMPP is used not only for messaging, but also for applications such as video calling, collaboration services, and more.
  - Understand how XMPP protocol services work: XMPP services are based on a client-server model. An XMPP server handles user authentication, message routing, and presence management (user status information). XMPP clients interact with the server to send and receive messages, manage contacts, and update their presence status. Servers can also be interconnected to allow communication between different domains.
  - Apply knowledge acquired in web and mobile programming: When implementing XMPP, it is essential to apply previous knowledge in web and mobile programming to integrate the protocol within modern applications. This includes developing attractive and functional user interfaces, optimizing real-time communication, and efficiently managing network and device resources.

By managing to implement and understand these objectives we will obtain a client who will be able to talk with other people who implement the xmpp algorithm. For this project, javascript was used in react to create the user interface, with which we can communicate between users. Now let's chat and be happy, always taking into account the security of the messages.

## Implemented functions
Some features implemented in this project were the following:
Account management
  - Register a new account on the server
  - Sign in with an account
  - Sign out of an account
  - Delete the server account

Communication between users
  - Show all contacts and their status.
  - Add a user to contacts
  - Show a user's contact details
  - 1 to 1 communication with any user/contact
  - Define presence message
  - Send/receive notifications
  - Send/receive files

## Prerequisites
A requirement that is extremely important to be able to test the project is that you must have Node js downloaded and installed. If you don't know where to download it, here is the link https://nodejs.org/en/download/package-manager.

## Dependencies
  - @xmpp/client - is a package that provides an XMPP (Extensible Messaging and Presence Protocol) client for Node.js and browsers. It allows web and mobile applications to communicate with XMPP servers for instant messaging, presence updates, and other real-time services. Install it using the following command.
    ```
    npm install @xmpp/client
    ```
  - react-router-dom – is the browser-specific version of the popular React Router, which makes it easy to navigate and manage routes in web applications built with React. Allows you to create single page applications (SPA) with multiple views installed using the following command.
    ```
    npm install react-router-dom
    ```
  - uuid: is a package for generating universally unique identifiers (UUID). These identifiers are useful for assigning unique identifiers to objects; users are installed using the following command.
    ```
    npm install uuid
    ```
  - react-toastify - is a library for displaying notifications in the form of "toasts" in React applications. It makes it easy to create attractive, configurable notifications without the need to manually manage status or items. Install it using the following command.
    ```
	  npm install react-toastify 
	  ```
  - tailwind - is a highly configurable CSS framework that provides utilities for designing interfaces directly in HTML. It is known for its "utility first" approach, meaning that most of the styling is applied using predefined classes that make writing CSS more efficient and is installed modularly using the following command.
    ```
    npm install -D tailwindcss
	  ```
    To start tailwind in our project, navigate to the folder where the project is and run the following command
    ```
	  npx tailwindcss init
	  ```
    in index.css put the following so that tailwind works in the project
    ```
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
## Use
To extract the project and run it, some steps are required, which are:
  1. First you must clone the repository to be able to obtain the project on our machine, to do this you must execute the following command
    ```
    git clone (repo link)
    ```
  2. Having already cloned the project, we are now going to proceed to go to the directory called project1Redes and there we will execute the following command:
    ```
    npm install
    ```
  4. As the next step after finishing the installation of npm install, we will proceed to run the project by executing the following command:
    ```
    npm run dev
    ```
  5. When you finish executing the previous step, a mini console will appear in which there are 2 options to go to the web and open the project, which are:
     
      a) One option would be to click directly on the link so that the browser opens and navigates to that link where the project is.
     
      b) Another option is to press h and press enter, this will open all the available options and then type o and press enter, or it will open the browser and the project automatically.

  6. We would already have the project running and displayed on the web ready to be able to chat with other people, enjoy chatting with users. Always remember to chat carefully.





    
