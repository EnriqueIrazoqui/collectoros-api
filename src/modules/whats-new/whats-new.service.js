const createHttpError = require("http-errors");
const whatsNewRepository = require("./whats-new.repository");

function normalizeWhatsNewEntry(entry) {
  if (!entry) {
    return null;
  }

  const viewedAt = entry.views?.[0]?.viewedAt || null;

  return {
    ...entry,
    isViewed: Boolean(viewedAt),
    viewedAt,
    views: undefined,
  };
}

async function getAllWhatsNewEntries() {
  return whatsNewRepository.findAllWhatsNewEntries();
}

async function createWhatsNew(userId, payload) {
  const data = {
    ...payload,
    createdBy: userId,
    publishedAt:
      payload.isPublished && !payload.publishedAt
        ? new Date()
        : payload.publishedAt
          ? new Date(payload.publishedAt)
          : null,
  };

  return whatsNewRepository.createWhatsNew(data);
}

async function getWhatsNewList(userId) {
  const entries = await whatsNewRepository.findPublishedWhatsNew(userId);

  return entries.map(normalizeWhatsNewEntry);
}

async function getLatestWhatsNew(userId) {
  const entry = await whatsNewRepository.findLatestPublishedWhatsNew(userId);

  return normalizeWhatsNewEntry(entry);
}

async function updateWhatsNew(whatsNewId, payload) {
  const existingEntry = await whatsNewRepository.findWhatsNewById(whatsNewId);

  if (!existingEntry) {
    throw createHttpError(404, "What's new entry not found");
  }

  const data = {
    ...payload,
  };

  if (Object.prototype.hasOwnProperty.call(payload, "publishedAt")) {
    data.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : null;
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "isPublished") &&
    payload.isPublished === true &&
    !existingEntry.publishedAt &&
    !payload.publishedAt
  ) {
    data.publishedAt = new Date();
  }

  return whatsNewRepository.updateWhatsNew(whatsNewId, data);
}

async function publishWhatsNew(whatsNewId) {
  const existingEntry = await whatsNewRepository.findWhatsNewById(whatsNewId);

  if (!existingEntry) {
    throw createHttpError(404, "What's new entry not found");
  }

  return whatsNewRepository.updateWhatsNew(whatsNewId, {
    isPublished: true,
    publishedAt: new Date(),
  });
}

async function deleteWhatsNew(whatsNewId) {
  const existingEntry = await whatsNewRepository.findWhatsNewById(whatsNewId);

  if (!existingEntry) {
    throw createHttpError(404, "What's new entry not found");
  }

  await whatsNewRepository.deleteWhatsNew(whatsNewId);
}

async function markWhatsNewAsViewed(userId, whatsNewId) {
  const existingEntry = await whatsNewRepository.findWhatsNewById(whatsNewId);

  if (!existingEntry) {
    throw createHttpError(404, "What's new entry not found");
  }

  return whatsNewRepository.markWhatsNewAsViewed(userId, whatsNewId);
}

module.exports = {
  getAllWhatsNewEntries,
  createWhatsNew,
  getWhatsNewList,
  getLatestWhatsNew,
  updateWhatsNew,
  publishWhatsNew,
  deleteWhatsNew,
  markWhatsNewAsViewed,
};