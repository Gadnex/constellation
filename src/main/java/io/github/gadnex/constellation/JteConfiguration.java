package io.github.gadnex.constellation;

import gg.jte.springframework.boot.autoconfigure.JteViewResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JteConfiguration {

  @Autowired
  public void configureJteViewResolver(JteViewResolver jteViewResolver) {
    jteViewResolver.setOrder(0);
  }
}
