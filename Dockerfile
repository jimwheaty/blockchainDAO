FROM ubuntu:bionic

RUN apt-get update \
 && apt-get install gnupg -y
