FROM ubuntu:14.04

RUN apt-get update -q && \
    apt-get -qy install wget

ENV VERSION 3.1.3

RUN wget http://haxe.org/download/file/$VERSION/haxe-$VERSION-linux64.tar.gz

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
