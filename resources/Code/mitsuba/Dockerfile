#
# based on
# https://github.com/iRath96/ears/blob/master/Dockerfile
#

# builder
FROM ubuntu:20.04 AS builder
LABEL authors="banbao990"

ENV TZ=Europe
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list
RUN sed -i 's/security.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list
# RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list
# RUN sed -i 's/security.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list

RUN apt-get update && \
    apt-get install -y \
        build-essential \
        scons \
        python2 \
        libgl1-mesa-dev \
        libglu1-mesa-dev \
        libxxf86vm-dev \
        libpng-dev \
        libjpeg-dev \
        libilmbase-dev \
        libxerces-c-dev \
        libboost-all-dev \
        libopenexr-dev \
        libglewmx-dev \
        libpcrecpp0v5 \
        libeigen3-dev \
        libfftw3-dev \
        wget && \
    apt-get clean && \
    apt-get autoclean && \
    apt-get autoremove

RUN wget https://github.com/OpenImageDenoise/oidn/releases/download/v1.4.1/oidn-1.4.1.x86_64.linux.tar.gz && \
    tar -xvzf oidn* --strip-components=1 -C /usr/local/ && \
    rm oidn*

RUN apt-get update && \
    apt-get install -y \
        libgl1-mesa-dev \
        libglu1-mesa-dev \
        libxxf86vm-dev \
        libpng-dev \
        libjpeg-dev \
        libilmbase-dev \
        libxerces-c-dev \
        libboost-all-dev \
        libopenexr-dev \
        libglewmx-dev \
        libpcrecpp0v5 \
        libeigen3-dev \
        libfftw3-dev && \
    apt-get clean && \
    apt-get autoclean && \
    apt-get autoremove

RUN apt-get install -y vim

WORKDIR /mitsuba
ENV PATH usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV LD_LIBRARY_PATH /usr/local/lib