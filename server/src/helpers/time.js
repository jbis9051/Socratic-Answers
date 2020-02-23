module.exports = {
    daysBetweenMili: (time1, time2) => {
       return (time1 - time2) / (1000 * 60 * 60 * 24);
    }
};
