# Google images are well maintained and lighter than officials
FROM google/nodejs

COPY run.sh /home/dev/run.sh

RUN useradd dev
RUN chown -R dev: /home/dev

USER dev
WORKDIR /home/dev

ENTRYPOINT ["/home/dev/run.sh"]
