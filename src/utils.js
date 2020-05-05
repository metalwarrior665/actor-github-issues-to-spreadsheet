module.exports.getColumnsOrder = (oneSheetPerRepository) => {
    if (oneSheetPerRepository) {
        return ['title', 'label1', 'label2', 'author', 'createdAt', 'updatedAt', 'comments', 'url'];
    }
    return ['repository', 'title', 'label1', 'label2', 'author', 'createdAt', 'updatedAt', 'comments', 'url'];
};
