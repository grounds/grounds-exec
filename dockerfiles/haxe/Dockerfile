FROM ubuntu:14.04

RUN apt-get update -qq && \
    apt-get -qy install wget

ENV VERSION 3.1.3
ENV SRSLY 3,1,3

RUN mkdir /haxe
RUN wget -O haxe.tar.gz http://haxe.org/website-content/downloads/$SRSLY/downloads/haxe-$VERSION-linux64.tar.gz &&\
    tar xzf haxe.tar.gz --strip=1 -C "/haxe"

ENV HAXE_STD_PATH /haxe/std/
ENV PATH /haxe/:$PATH

# Set the locale
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8

ENV DEV /home/dev

COPY run.sh $DEV/run.sh

RUN useradd dev
RUN chown -R dev: $DEV

USER dev
WORKDIR $DEV

ENTRYPOINT ["./run.sh"]
