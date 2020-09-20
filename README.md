# github-hosts

*Simple command line utility for querying and updating hosts of GitHub.*

## Install

```bash
npm i github-hosts -g
```

## Usage

To modify the hosts file of OS automatically, you must run the command as admin.

```bash
# run as admin (on shell)
> sudo github-hosts

# or run without install
> sudo npx github-hosts
```

Or run as normal user and update the hosts file of OS manually.
The content of hosts will be copied to the clipboard.

```bash
# run as normal user and paste the contents by manual
> github-hosts

# or run without install
> npx github-hosts
```

To clear the host entry of GitHub, you can run the command with '-c' argument.
You must run the command as admin for modify the hosts file.

```bash
# clear the host entry of GitHub (on shell)
> sudo github-hosts -c

# or run without install
> sudo npx github-hosts -c
```

Since version 1.1.0, this tool will be download data from remote to keep domains up to date.
You can also use the '-u' argument to define an url which contains a string array json data to replace the defaults.

```bash
# customize the domains data by remote url
> sudo github-hosts -u "https://some.json.data/string-array.json"

# or run without install
> sudo npx github-hosts -u "https://some.json.data/string-array.json"
```

If you are using Windows OS, you could use the "Run As Administrator" item of context menu for cmd to get admin permission.






