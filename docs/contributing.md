---
id: contributing
title: Contributing
sidebar_label: Contributing
---

Contributions to the project can be in form of issue submissions, feature requests, writing code , and documentation

Issues and feature requests should be submitted at the project's Github [issue page](https://github.com/bodastage/bts-ce-lite/issues). Code 
submissions and documentation should be submitted through Git pull requests(PRs)

## How to submit PRs

### Setting up

1. Create github account at https://www.github.com
2. Fork the https://github.com/bodastage/bts-ce-lite repository
3. Clone your forked repo locally
	```bash
	git clone url_to_repo
	```
4. Add origin repo to your remotes. This will be used to keep the master branch in sync with the original repo
	```bash
	git remote add upstream url_to_original_repo
	```
5. Create feature/patch branch
	```
	git checkout -b patch_branch
	```
6. Make changes to file

7. Stage the changes
	```bash
	git add ./*
	```
8. Commit the changes
	```bash
	git commit -m "Fix issue ..."
	```
9. Push feature/patch to github
	```bash
	git push origin patch_branch
	```
10. Create pull request(PR). Go to you forked repo and create PR

### Submit another changes

1. checkout the master branch
	```
	git checkout master
	```
2. Pull changes from the original repo’s master to your local master.
	```bash
	git fetch upstream
	```
3. Merge changes into local master
	```bash
	git merge --ff upstream/master
	```
4. Create feature/patch branch
	```bash
	git checkout -b patch_branch
	```
5. Make changes to file and stage the changes
	```
	git add ./*
	```
6. Commit the changes
	```
	git commit -m "Fix issue ..."
	```
7. Push feature/patch to github
	```
	git push origin patch_branch
	```
8. Create PR. Go to you forked repo and create PR