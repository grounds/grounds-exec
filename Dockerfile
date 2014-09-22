FROM google/nodejs:0.10.30

ENV APP /grounds-exec

# Add user exec.
RUN useradd exec

# Copy package.json into the image.
COPY package.json $APP/

# npm install inside app's location.
RUN cd $APP && npm install

# Everything up to here was cached. This includes
# the npm install, unless package.json changed.
COPY . $APP

# Changes app's files owner.
RUN chown -R exec:exec $APP

# Add project binaries directory to PATH.
ENV PATH $PATH:$APP/bin

# Set the final working dir to the app's location.
WORKDIR /grounds-exec

# Switch to user exec.
USER exec
