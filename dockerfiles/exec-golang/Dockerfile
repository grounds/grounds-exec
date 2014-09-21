FROM google/golang:latest

COPY run.sh /gopath/run.sh

RUN useradd dev
RUN chown -R dev: /gopath

WORKDIR /gopath
USER dev

ENTRYPOINT ["/gopath/run.sh"]
