FROM python:2.7.8 

COPY run.sh /home/dev/run.sh

RUN useradd dev
RUN chown -R dev: /home/dev

USER dev
WORKDIR /home/dev

ENTRYPOINT ["/home/dev/run.sh"]