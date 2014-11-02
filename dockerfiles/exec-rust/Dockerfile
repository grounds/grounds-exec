FROM ubuntu:14.04
RUN apt-get update -qq
RUN curl -s https://static.rust-lang.org/rustup.sh | sudo sh
COPY run.sh /home/dev/run.sh
RUN useradd dev
RUN chown -R dev: /home/dev
USER dev
WORKDIR /home/dev
ENTRYPOINT ["/home/dev/run.sh"]
