# NearestFriend-Server

This project is a part of CS492 project (NearestFriend)

## Dependencies
  - Mongoose: mongoose depends on kerberos, we will talk about how to install kerberos into your system

## Install kerberos on UNIX
If you don’t have the build essentials it won’t build. In the case of linux you will need gcc and g++, node.js with all the headers and python. The easiest way to figure out what’s missing is by trying to build the kerberos project. You can do this by performing the following steps.

```
git clone https://github.com/christkv/kerberos.git
cd kerberos
npm install
```

If all the steps complete you have the right toolchain installed. If you get node-gyp not found you need to install it globally by doing.

```
npm install -g node-gyp
```

If correctly compiles and runs the tests you are golden. We can now try to install the kerberos module by performing the following command.

```
cd NearestFriend-Server
npm install kerberos --save
```

If it still fails the next step is to examine the npm log. Rerun the command but in this case in verbose mode.

```
npm --loglevel verbose install kerberos
```

This will print out all the steps npm is performing while trying to install the module.

We omit the Windows installation


