define([
  'render/Shader',
  'render/shaders/ShaderMatcap',
  'render/Render'
], function (Shader, ShaderMatcap, Render) {

  'use strict';

  function GuiRendering(guiParent, ctrlGui) {
    this.sculptgl_ = ctrlGui.sculptgl_; // main application

    // ui shading
    this.ctrlFlatShading_ = null; // flat shading controller
    this.ctrlShowWireframe_ = null; // wireframe controller
    this.ctrlShaders_ = null; // shaders controller
    this.ctrlMatcap_ = null; // matcap texture controller
    this.ctrlUV_ = null; // upload a texture

    this.init(guiParent);
  }

  GuiRendering.prototype = {
    /** Initialize */
    init: function (guiParent) {
      var self = this;
      var main = this.sculptgl_;
      // dummy object with empty function or startup mockup
      var dummy = {
        type_: Shader.mode.MATCAP,
        material_: 0,
      };
      // render fold
      var foldRender = guiParent.addFolder('Rendering');
      var optionsShaders = {
        'Matcap': Shader.mode.MATCAP,
        'Phong': Shader.mode.PHONG,
        'Transparency': Shader.mode.TRANSPARENCY,
        'Normal shader': Shader.mode.NORMAL,
        'UV shader': Shader.mode.UV
      };
      this.ctrlShaders_ = foldRender.add(dummy, 'type_', optionsShaders).name('Shader');
      this.ctrlShaders_.onChange(function (value) {
        var val = parseInt(value, 10);
        if (main.mesh_) {
          main.mesh_.setShader(val);
          main.scene_.render();
        }
        self.ctrlMatcap_.__li.hidden = val !== Shader.mode.MATCAP;
        self.ctrlUV_.__li.hidden = val !== Shader.mode.UV;
      });

      // matcap texture
      var optionMaterials = {};
      for (var i = 0, mats = ShaderMatcap.materials, l = mats.length; i < l; ++i)
        optionMaterials[mats[i].name] = i;
      this.ctrlMatcap_ = foldRender.add(dummy, 'material_', optionMaterials).name('Material');
      this.ctrlMatcap_.__li.hidden = dummy.type_ !== Shader.mode.MATCAP;
      this.ctrlMatcap_.onChange(function (value) {
        if (main.mesh_) {
          main.mesh_.setMaterial(value);
          main.scene_.render();
        }
      });

      // uv texture
      this.ctrlUV_ = foldRender.add(this, 'importTexture').name('Import (jpg, png...)');
      this.ctrlUV_.__li.hidden = dummy.type_ !== Shader.mode.UV;
      document.getElementById('textureopen').addEventListener('change', this.loadTexture.bind(this), false);

      var dummyRender = {
        flatShading_: true,
        showWireframe_: true
      };

      // flat shading
      this.ctrlFlatShading_ = foldRender.add(dummyRender, 'flatShading_').name('flat (slower)');
      this.ctrlFlatShading_.onChange(function (value) {
        if (main.mesh_) {
          main.mesh_.setFlatShading(value);
          main.scene_.render();
        }
      });

      // wireframe
      this.ctrlShowWireframe_ = foldRender.add(dummyRender, 'showWireframe_').name('wireframe');
      this.ctrlShowWireframe_.onChange(function (value) {
        if (main.mesh_) {
          main.mesh_.setShowWireframe(value);
          main.scene_.render();
        }
      });
      if (Render.ONLY_DRAW_ARRAYS)
        this.ctrlShowWireframe_.__li.hidden = true;

      foldRender.open();
    },
    /** Update information on mesh */
    updateMesh: function (mesh) {
      var render = mesh.getRender();
      this.ctrlShaders_.object = render.shader_;
      this.ctrlFlatShading_.object = render;
      this.ctrlShowWireframe_.object = render;
      this.ctrlMatcap_.object = render;
      this.updateDisplay(mesh);
    },
    /** Update display of widgets */
    updateDisplay: function (mesh) {
      this.ctrlShaders_.updateDisplay();
      this.ctrlFlatShading_.updateDisplay();
      this.ctrlShowWireframe_.updateDisplay();
      this.ctrlMatcap_.updateDisplay();
      var val = mesh.getRender().shader_.type_;
      this.ctrlMatcap_.__li.hidden = val !== Shader.mode.MATCAP;
      this.ctrlUV_.__li.hidden = val !== Shader.mode.UV;
    },
    /** Return true if flat shading is enabled */
    getFlatShading: function () {
      return this.ctrlFlatShading_.getValue();
    },
    /** Return true if wireframe is displayed */
    getWireframe: function () {
      return this.ctrlShowWireframe_.getValue();
    },
    /** Return the value of the shader */
    getShader: function () {
      return this.ctrlShaders_.getValue();
    },
    /** Immort texture */
    importTexture: function () {
      document.getElementById('textureopen').click();
    },
    /** Load texture */
    loadTexture: function (event) {
      if (event.target.files.length === 0)
        return;
      var file = event.target.files[0];
      if (!file.type.match('image.*'))
        return;
      var reader = new FileReader();
      var main = this.sculptgl_;
      reader.onload = function (evt) {
        // urk...
        var shaderUV = Shader[Shader.mode.UV];
        shaderUV.texture0 = undefined;
        shaderUV.texPath = evt.target.result;
        main.scene_.render();
        document.getElementById('textureopen').value = '';
      };
      reader.readAsDataURL(file);
    },
  };

  return GuiRendering;
});