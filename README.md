# github-hosts

*A simple tool of command line to query and set hosts of GitHub.*

## Install

```bash
npm i github-hosts -g
```

## Usage

To modify the hosts file of OS automatically, you must run the command as admin.

```bash
# run as admin (on shell)
> sudo github-hosts
```

Or run as normal user and update the hosts file of OS manually.
The content of hosts will be copied to the clipboard.

```bash
# run as normal user and paste the contents by manual
> github-hosts
```

To clear the host entry of GitHub, you can run the command with '-c' argument.
You must run the command as admin for modify the hosts file.

```bash
# clear the host entry of GitHub (on shell)
> sudo github-hosts -c
```

If you are using Windows OS, you could use the "Run As Administrator" item of context menu for cmd to get admin permission.






