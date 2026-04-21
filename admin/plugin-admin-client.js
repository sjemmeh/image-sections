export function createPluginAdminClient(pluginName) {
  if (!pluginName) {
    throw new Error('pluginName is required');
  }

  const base = `/api/admin/plugins/${encodeURIComponent(pluginName)}`;

  async function parseResponse(response, fallbackMessage) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.message || fallbackMessage);
    }
    return payload;
  }

  return {
    async listDataScope(scope) {
      const response = await fetch(`${base}/data/${encodeURIComponent(scope)}`, {
        credentials: 'include',
      });
      const payload = await parseResponse(response, `Failed to load ${scope}`);
      return payload.records || [];
    },

    async upsertDataRecord(scope, key, value) {
      const response = await fetch(
        `${base}/data/${encodeURIComponent(scope)}/${encodeURIComponent(key)}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        },
      );
      await parseResponse(response, `Failed to save ${scope}`);
    },

    async deleteDataRecord(scope, key) {
      const response = await fetch(
        `${base}/data/${encodeURIComponent(scope)}/${encodeURIComponent(key)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      await parseResponse(response, `Failed to remove ${scope} item`);
    },

    async uploadFile(file) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${base}/uploads`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const payload = await parseResponse(response, 'Upload failed');
      if (!payload?.url) {
        throw new Error('Upload response did not include file URL');
      }
      return payload.url;
    },
  };
}
