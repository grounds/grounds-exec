FROM ubuntu:14.04

RUN apt-get update -q && \
    apt-get -qy install wget

RUN wget http://haxe.org/website-content/downloads/3,1,3/downloads/haxe-3.1.3-linux64.tar.gz
RUN tar xf haxe-3.1.3-linux64.tar.gz
RUN cp haxe-3.1.3/haxe /usr/bin/

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
