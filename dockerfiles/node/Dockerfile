# Google images are well maintained and lighter than officials
FROM google/nodejs

ENV DEV /home/dev

COPY run.sh $DEV/run.sh

RUN useradd dev
RUN chown -R dev: $DEV

USER dev
WORKDIR $DEV

ENTRYPOINT ["./run.sh"]
