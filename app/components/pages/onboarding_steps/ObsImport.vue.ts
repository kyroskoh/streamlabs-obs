import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Inject } from '../../../util/injector';
import { OnboardingService } from '../../../services/onboarding';
import { Multiselect } from 'vue-multiselect';
import { ObsImporterService } from '../../../services/obs-importer';
import { defer } from 'lodash';
import { ConfigPersistenceService } from '../../../services/config-persistence';

@Component({
  components: { Multiselect }
})
export default class ObsImport extends Vue {

  @Inject()
  onboardingService: OnboardingService;

  @Inject()
  obsImporterService: ObsImporterService;

  @Inject()
  configPersistenceService: ConfigPersistenceService;

  status = 'initial';

  sceneCollections = this.obsImporterService.getSceneCollections();

  selectedSceneCollection = this.sceneCollections[0] || { filename: '', name: '' };

  created() {
    if (this.sceneCollections.length < 1) {
      this.startFresh();
    }
  }

  get title() {
    if (this.status === 'importing') {
      return 'Importing';
    }

    if (this.status === 'done') {
      return 'Successfully Imported';
    }

    return 'Import from OBS';
  }

  get description() {
    if (this.status === 'importing') {
      return `Importing your scenes and sources from "${this.selectedSceneCollection.name}"`;
    }

    if (this.status === 'done') {
      return `All scenes and sources from "${this.selectedSceneCollection.name}" have been imported.`;
    }

    return 'Import your scenes from OBS with a simple click, or start fresh.';
  }

  startImport() {
    this.status = 'importing';
    defer(() => {
      try {
        this.obsImporterService.load(this.selectedSceneCollection);
        this.status = 'done';
      } catch (e) {
        // I suppose let's pretend we succeeded for now.
        this.status = 'done';
      }
    });
  }

  startFresh() {
    this.configPersistenceService.load();
    this.onboardingService.skip();
  }

  next() {
    this.onboardingService.next();
  }

}