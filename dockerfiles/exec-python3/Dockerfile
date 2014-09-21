FROM python:latest

COPY run.sh /home/dev/run.sh

RUN useradd dev
RUN chown -R dev: /home/dev

WORKDIR /home/dev
USER dev

ENTRYPOINT ["/home/dev/run.sh"]
