Cloud-ddd
=========

Event Sourcing demo application build in the cloud using hetrogeneouos technologies and web standards.

Organisation Directory
----------------------
- A SPA used to maintain details of organisations
	- nodejs
	- breezejs
	- mongodb (lob data)
	- durnadal
	- knockout
	- AWS SimpleDB (Event Sourcing Repo)
	- Hosted on AWS using an ubuntu server
- OrgDir Event Source
	- nodejs
	- express
	- AWS SimpleDB (Event Sourcing Repo)

Contract Centre
---------------
- Website used to manage contracts for organisations
	- ASP.NET MVC web App
	- SQL Azure
- Change Processor
	- Azure worker roll, polls "OrgDir Event Source" for changes
	- SQL Azure
	- Topics and Queues

