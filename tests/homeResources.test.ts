import assert from 'node:assert/strict';
import {
  DEFAULT_HOME_RESOURCES_CONFIG,
  isValidVideoDuration,
  normalizeHomeResourcesConfig,
  normalizeResourceUrl,
} from '../data/homeResources';

const migrated = normalizeHomeResourcesConfig({
  omapiHourTitle: 'Rencontres',
  videoTitle: 'Tutoriel',
  videoDuration: '04:15',
});
assert.equal(migrated.omapiHourUrl, '/events');
assert.equal(migrated.videoUrl, '');
assert.equal(migrated.videoThumbnail, DEFAULT_HOME_RESOURCES_CONFIG.videoThumbnail);
assert.equal(migrated.videoDuration, '04:15');
assert.equal(normalizeHomeResourcesConfig({ omapiHourTitle: '   ' }).omapiHourTitle, DEFAULT_HOME_RESOURCES_CONFIG.omapiHourTitle);
assert.equal(normalizeResourceUrl('javascript:alert(1)', '/guides'), '/guides');
assert.equal(normalizeResourceUrl('//example.com', '/events'), '/events');
assert.equal(normalizeResourceUrl('/guides', '/events'), '/guides');
assert.equal(normalizeResourceUrl('https://example.com/watch', ''), 'https://example.com/watch');
assert.equal(isValidVideoDuration('04:15'), true);
assert.equal(isValidVideoDuration('1:02:15'), true);
assert.equal(isValidVideoDuration('4:75'), false);
assert.equal(isValidVideoDuration(''), true);

console.log('Home resources tests passed');
